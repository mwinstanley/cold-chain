class CreateValues < ActiveRecord::Migration
  def change
    create_table :values do |t|
      t.string :id_from_file
      t.string :color
      t.string :name
      t.integer :field_id

      t.timestamps
    end
  end
end
