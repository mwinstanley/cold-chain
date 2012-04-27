class InfoBox < ActiveRecord::Base
  attr_accessible :title_field

  belongs_to :user_options
  has_and_belongs_to_many :fields

end
