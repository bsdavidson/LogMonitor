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

  def log_to_array(filename, string = nil)
    log_array = []
    File.open(File.join(settings.logs,filename), 'r') do |f1|
      while line = f1.gets
        if string.nil? or line.include? string
          log_array << line
        end
      end
    end

    return {
      filename: filename,
      lines: log_array.reverse
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
    puts log_list.inspect
    log_list.to_json
  end

  get '/api/v1/logs/:logfile/?' do
    file = params[:logfile]
    filter = params[:filter]
    output = log_to_array(file, filter)
    puts output.length
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
