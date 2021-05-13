require 'nokogiri'
require 'open-uri'
require 'json'

def app_variable
  doc = Nokogiri::HTML(URI.open('https://www.ifixit.com/Search/'))
  script = doc.xpath('//script').find { |t| t.content =~ /var App/ }
  raise "Couldn't find script tag" unless script

  app = script.content
  matches = /var App = (\{.*\});$/.match app
  raise "Couldn't parse variable" unless matches[1]

  JSON.parse(matches[1])
end
