class FileProperty < ActiveRecord::Base
  attr_accessible nil

  has_many :fields, :dependent => :destroy
  belongs_to :user_options

end
