class Display < ActiveRecord::Base
  attr_accessible :name, :data, :user_options, :display_type

  serialize :data
  belongs_to :user_options

  def self.getDisplays(user_id, display)
    Display.where("user_options_id = ? AND display_type = ?", user_id, display)
  end

end
