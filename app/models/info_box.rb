class InfoBox < ActiveRecord::Base
  attr_accessible :title_field, :data, :user_options

  serialize :data
  belongs_to :user_options
  has_and_belongs_to_many :fields

  def as_json(options = nil)
    hash = { "title_field" => title_field,
             "data" => data.as_json }
    hash
  end

end
