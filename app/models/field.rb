class Field < ActiveRecord::Base
  attr_accessible nil

  has_many :values, :dependent => :destroy

end
