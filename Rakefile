require 'bundler/setup'

ENV['RACK_ENV'] ||= 'development'

$LOAD_PATH << File.join(File.dirname(__FILE__))
require 'app'

desc 'Install Git hooks'
task :githooks do
  puts 'Installing git pre-commit hooks'
  open('.git/hooks/pre-commit', 'w') do |file|
    file.write "#!/bin/sh\n"
    file.write "rake lint\n"
  end
  chmod 0755, '.git/hooks/pre-commit', verbose: false
end

desc 'Use rubocop and grunt validate source files'
task :lint do
  sh 'rubocop --display-cop-names'
  sh 'npm test'
end

desc 'Use Guard to watch for changes and reload things'
task :watch do
  require 'guard'
  exec 'guard', 'start', '--clear'
end
