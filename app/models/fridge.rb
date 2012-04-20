class Fridge < ActiveRecord::Base
  has_many :features
  belongs_to :facility

end
