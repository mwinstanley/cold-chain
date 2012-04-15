class UserOptions < ActiveRecord::Base
  attr_accessible nil

  has_many :file_properties, :dependent => :destroy

end
