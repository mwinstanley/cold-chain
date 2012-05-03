class FridgeOptions < ActiveRecord::Base
  attr_accessible :file_name, :main_col, :join_main, :user_options

  belongs_to :user_options
  has_many :field_options, :as => :info_options
  has_many :fields, :through => :field_options

  def as_json(options = nil)
    hash = { "file_name" => file_name,
             "main_col" => main_col,
             "join_main" => join_main,
             "field_options" => [] }
    field_options.each do |fo|
      hash["fridge_options"] << fo.as_json
    end
    hash
  end
end
