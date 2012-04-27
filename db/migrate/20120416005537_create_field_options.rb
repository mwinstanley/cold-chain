class CreateFieldOptions < ActiveRecord::Migration
  def self.up
    create_table :field_options do |t|
      t.references :info_options, :polymorphic => true
      t.references :field
      t.string :readable_name
      t.string :field_type
    end
  end

  def self.down
    drop_table :field_options
  end
end
