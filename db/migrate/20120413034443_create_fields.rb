class CreateFields < ActiveRecord::Migration
  def change
    create_table :fields do |t|
      t.string :id_in_file
      t.string :name
      t.string :field_type
      t.string :display_type
      t.boolean :in_info_box

      t.timestamps
    end
  end
end
