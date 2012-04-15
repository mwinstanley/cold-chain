class FeatureSet < ActiveRecord::Base
  attr_accessible nil

  has_many :features, :dependent => :destroy

end
