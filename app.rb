require 'sinatra/base'
require 'json'

class App < Sinatra::Base
  enable :static
  set :app_file,       __FILE__
  set :root,           ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/')
  set :views,          ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/views')
  set :logs,           ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/logs')
  set :public_folder,  ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/public')


  helpers do
    def json(code, response)
      content_type 'application/json'
      halt code, response.to_json
    end
  end

  def log_to_array(filename, string = nil, seekpos = 0)
    log_array = []
    last_file_pos = 0
    File.open(File.join(settings.logs,filename), 'r') do |f1|
      if seekpos == 0
        f1.seek(0, IO::SEEK_END)
        endpos = f1.pos
        puts "End Pos #{endpos}"
      end

      if seekpos == 0 and endpos >= 300000
        f1.seek(-300000, IO::SEEK_END)
      else
        f1.seek(seekpos)
      end
      while line = f1.gets
         last_file_pos = f1.pos
        if string.nil? or line.include? string
          log_array << { time: 0, line: line }
        end
      end

    end

    log_array = log_array.reverse
    return {
      filename: filename,
      lastfilepos: last_file_pos,
      lines: log_array
    }
  end

  def log_stats(log_array, string)
    num_of_lines = log_array.length
  end

  get '/' do
    erb :index
  end

  get '/api/v1/logs/?' do
    log_list = Dir.glob(File.join(settings.logs, '*')).map do |filename|
      filename = File.basename(filename)
      puts "#{filename}"
      {filename: filename}
    end
    log_list.to_json
  end

  get '/api/v1/logs/:logfile/?' do
    file = params[:logfile]
    filter = params[:filter]
    seek = params[:seek].to_i
    output = log_to_array(file, filter, seek)
    puts output.inspect
    puts output.to_json.inspect
    output.to_json
  end


  # get '/api/v1/logstat/:logfile/:string/?' do
  #   file = params[:logfile]
  #   string = params[:string]
  #   log_array = log_to_array(file, string)
  #   @string_count = log_array.length
  #   erb :index
  # end

end
