class Feature < ActiveRecord::Base
  attr_accessible :name, :value

  belongs_to :feature_set

end
