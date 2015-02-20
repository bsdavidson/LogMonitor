require 'sinatra/base'
require 'json'

class App < Sinatra::Base
  enable :static
  set :app_file, __FILE__
  set :root, ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/')
  set :views, ::File.join(
    ::File.expand_path(::File.dirname(__FILE__)), '/views')
  set :logs, ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/logs')
  set :public_folder, ::File.join(
    ::File.expand_path(::File.dirname(__FILE__)), '/public')

  helpers do
    def json(code, response)
      content_type 'application/json'
      halt code, response.to_json
    end
  end

  def get_seek_pos(file, seekpos)
    # New request, get ending position
    if seekpos == 0
      file.seek(0, IO::SEEK_END)
      endpos = file.pos
    end
    # If new file request is bigger than 500K, set starting position.
    if seekpos == 0 && endpos >= 300_000
      file.seek(-300_000, IO::SEEK_END)
      seekpos = file.pos
    end
    seekpos
  end

  def string_status(string, line)
    if string.nil?
        'nil'
    elsif line.include? string
        'yes'
    else
        'no'
    end
  end

  def log_to_array(filename, string = nil, seekpos = 0)
    log_array = []
    last_file_pos = 0
    find_count = 0
    File.open(File.join(settings.logs, filename), 'r') do |f1|
      f1.pos = get_seek_pos(f1, seekpos)
      while line = f1.gets
        last_file_pos = f1.pos
        s = string_status(string, line)
        if s == 'yes'
          find_count = find_count + 1
            if find_count.even?
              even_odd = 'even'
            else
              even_odd = 'odd'
            end
        end
        log_array << { even_odd: even_odd , match: s, line: line }
      end
    end

    log_array = log_array.reverse
    {
      filename: filename,
      lastfilepos: last_file_pos,
      filterString: string,
      lines: log_array,
      findcount: find_count
    }
  end

  get '/' do
    erb :index
  end

  get '/api/v1/logs/?' do
    log_list = Dir.glob(File.join(settings.logs, '*')).map do |filename|
      filename = File.basename(filename)
      { filename: filename }
    end
    log_list.to_json
  end

  get '/api/v1/logs/:logfile/?' do
    file = params[:logfile]
    filter = params[:filter]
    seek = params[:seek].to_i
    output = log_to_array(file, filter, seek)
    output.to_json
  end
end
