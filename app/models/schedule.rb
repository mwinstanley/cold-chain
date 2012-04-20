class Schedule < ActiveRecord::Base
  attr_accessible :name

  has_many :features
  belongs_to :facility

end
