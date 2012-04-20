class Feature < ActiveRecord::Base
  attr_accessible :field, :value

  belongs_to :feature_set
  belongs_to :field
  belongs_to :value

end
