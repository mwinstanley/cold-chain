class ScheduleOptions < ActiveRecord::Base
  attr_accessible :file_names, :file_readable_names, :main_col, :join_main, :user_options

  serialize :file_names
  serialize :file_readable_names

  belongs_to :user_options
  has_many :field_options, :as => :info_options
  has_many :fields, :through => :field_options

  def as_json(options = nil)
    hash = { "file_names" => file_names,
             "file_readable_names" => file_readable_names,
             "main_col" => main_col,
             "join_main" => join_main,
             "field_options" => [] }
    field_options.each do |fo|
      hash["field_options"] << fo.as_json
    end
    hash
  end



end
