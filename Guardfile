guard :shotgun, server: 'thin' do
  logger level: :error
  watch 'config.ru'
end

guard :rake, task: 'lint' do
  watch(%r{(?:.+/)?\.rubocop\.yml$}) { |m| File.dirname(m[0]) }
  watch(%r{^public/js/(.+)\.js$})
  watch(%r{^public/css/(.+)\.scss$})
  watch 'Gemfile'
  watch 'Guardfile'
  watch 'Rakefile'
  watch 'config.ru'
end
