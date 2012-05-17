class ScheduleOptions < ActiveRecord::Base
  attr_accessible :file_names, :file_readable_names, :main_col, :join_main, :user_options

  serialize :file_names
  serialize :file_readable_names

  belongs_to :user_options
  has_many :field_options, :as => :info_options, :dependent => :destroy
  has_many :fields, :through => :field_options

  def as_json(options = nil)
    hash = { "file_names" => file_names,
             "file_readable_names" => file_readable_names,
             "main_col" => main_col,
             "join_main" => join_main,
             "field_options" => {} }
    field_options.each do |fo|
      hash["field_options"][fo.field.name] = fo.as_json
    end
    hash
  end

  def update_field_options(opt)
    field_options.delete_all
    field_options.each do |fo|
      new_opt = opt[fo.field.name]
      if !new_opt.nil?
        fo.update_attributes(:readable_name => new_opt["readable_name"],
                             :field_type => new_opt["field_type"])
        opt[fo.field.name] = nil
      else
        fo.delete
      end
    end
    opt.each do |field,vals|
      if !vals.nil?
        field_options <<
          FieldOption.create_with_hash(vals, self, file_names.first)
      end
    end
  end

end
