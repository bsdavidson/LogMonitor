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
  set :buffer, 1_000_000

  helpers do
    def json(code, response)
      content_type 'application/json'
      halt code, response.to_json
    end
  end

  def get_seek_pos(file, seekpos)
    # New request, get ending position

    file.seek(0, IO::SEEK_END)
    endpos = file.pos
    bytes_left = endpos - seekpos

    if bytes_left > settings.buffer
      segments = (bytes_left / settings.buffer) + 1
    else
      segments = 0
    end
    {
      seekpos: seekpos,
      file_size: endpos,
      segments_left: segments
    }
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

  def log_to_array(filename, lastline = 0, seekpos = 0)
    log_array = []
    last_file_pos = 0
    line_count = lastline
    seek_data = {}
    File.open(File.join(settings.logs, filename), 'r') do |f1|
      seek_data = get_seek_pos(f1, seekpos)
      f1.pos = seekpos
      bytes_to_read = settings.buffer
      while (line = f1.gets)
        break if bytes_to_read <= (f1.pos - seekpos)
        last_file_pos = f1.pos
        # s = string_status(string, line)
        line_count += 1
        log_array << { lineno: line_count, line: line }

      end
    end

    log_array = log_array.reverse
    {
      filename: filename,
      lastfilepos: last_file_pos,
      segments: seek_data[:segments_left],
      filesize: seek_data[:file_size],
      lines: log_array,
      linecount: line_count
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
    lastline = params[:lastline].to_i
    seek = params[:seek].to_i
    output = log_to_array(file, lastline, seek)
    output.to_json
  end
end
