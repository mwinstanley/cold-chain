class CreateFieldOptions < ActiveRecord::Migration
  def change
    create_table :field_options do |t|
      t.integer :field_id
      t.string :name
      t.integer :field_type_id
      t.integer :display_type_id
      t.boolean :in_info_box
      t.integer :file_property_id

      t.timestamps
    end
  end
end
