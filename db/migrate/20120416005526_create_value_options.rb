class CreateValueOptions < ActiveRecord::Migration
  def self.up
    create_table :value_options do |t|
      t.references :value, :field_option
      t.string :name
    end
  end

  def self.down
    drop_table :value_options
  end
end
