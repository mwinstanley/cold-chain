class Value < ActiveRecord::Base
  attr_accessible :id_from_file, :color, :name

  belongs_to :field

end
