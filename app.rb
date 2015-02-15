require 'sinatra/base'
require 'json'

class App < Sinatra::Base
  enable :static
  set :app_file,       __FILE__
  set :root,           ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/')
  set :views,          ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/views')
  set :public_folder,  ::File.join(::File.expand_path(::File.dirname(__FILE__)), '/public')


  helpers do
    def json(code, response)
      content_type 'application/json'
      halt code, response.to_json
    end
  end

  def log_to_array(filename, string = nil)
    log_array = []
    File.open(filename, 'r') do |f1|
      while line = f1.gets
        if string.nil? or line.include? string
          log_array << { :line => line }
        end
      end
    end
    return log_array.to_json
  end

  def log_stats(log_array, string)
    num_of_lines = log_array.length
  end

  def hello
    return 'Hello!'
  end

  get '/' do
    erb :index
  end

  get '/api/v1/log/:logfile/?' do
    file = params[:logfile]
    output = log_to_array(file)
    @error = 'ERROR!'
    puts output.length
    output
  end

  get '/api/v1/log/:logfile/:string/?' do
    file = params[:logfile]
    string = params[:string]
    output = log_to_array(file, string)
    puts output.length
    output
  end

  get '/api/v1/logstat/:logfile/:string/?' do
    file = params[:logfile]
    string = params[:string]
    log_array = log_to_array(file, string)
    @string_count = log_array.length
    erb :index
  end

end
