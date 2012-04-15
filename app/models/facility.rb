class Facility < ActiveRecord::Base
  attr_accessible nil

  has_many :feature_sets, :dependent => :destroy

end
