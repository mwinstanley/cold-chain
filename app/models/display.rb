class Display < ActiveRecord::Base
  attr_accessible :name, :data, :user_options, :display_type

  belongs_to :user_options

end
