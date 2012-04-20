class FileProperty < ActiveRecord::Base
  attr_accessible :name, :title, :p_type, :join_main, :join_secondary, :user_options_id

  has_many :field_options, :dependent => :destroy
  belongs_to :user_options
  has_many :fields, :through => :field_options

  def as_json(options = nil)
    hash = { "name" => self.name,
             "title" => self.title,
             "p_type" => self.p_type,
             "join_main" => self.join_main,
             "join_secondary" => self.join_secondary,
             "field_options" => {} }
    for f in field_options do
      hash["field_options"][f.field.name] = f
    end
    hash
  end

  def update_field_options(opt)
    field_options.each do |fo|
      new_opt = opt[fo.field.name]
      if !new_opt.nil?
        fo.update_attributes(:name => new_opt["name"],
                             :field_type => FieldType.find_or_create(new_opt["type"]))
        opt[fo.field.name] = nil
      else
        fo.destroy
      end
    end
    opt.each do |field,vals|
      if !vals.nil?
        field_options <<
          FieldOption.create_with_hash(vals, self)
      end
    end

  end

  def self.create_with_hash(prop_type, hash, options)
    logger.debug "creating file property with hash"
    create! do |properties|
      logger.debug hash
      properties.name = hash["name"]
      properties.title = hash["title"]
      properties.p_type = prop_type
      properties.join_main = hash["join_main"]
      properties.join_secondary = hash["join_secondary"]
      properties.user_options = options
    end
  end

end
