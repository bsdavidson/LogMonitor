require 'sinatra/base'
require 'json'

class App < Sinatra::Base
  enable :static

  helpers do
    def json(code, response)
      content_type 'application/json'
      halt code, response.to_json
    end
  end

  def open_log(filename)
    file_array = []
    File.open(filename, 'r') do |f1|
      while line = f1.gets
        file_array << line
      end
    end
    return file_array
  end

  def hello
    return 'Hello!'
  end

  get '/' do
    open_log('log.txt')
    erb :index
  end

  get '/log/:logfile/?' do
    file = params[:logfile]
    @output = open_log(file)
    @error = 'ERROR!'
    json(200, @output)
  end

end
