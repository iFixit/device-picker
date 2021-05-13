#!/usr/bin/env ruby

require_relative './app'
require 'json'

app = app_variable
algolia_config = app['algoliaConfig']

open('.env', 'w') do |fi|
  fi.puts("API_KEY=#{algolia_config['apiKey']}")
  fi.puts("APP_ID=#{algolia_config['appId']}")
end

keys = {
  'API_KEY' => algolia_config['apiKey'],
  'APP_ID' => algolia_config['appId']
}
open('src/algoliaConfig.json', 'w') do |fi|
  fi.write(JSON.generate(keys))
end
