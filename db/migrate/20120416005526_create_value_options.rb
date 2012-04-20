class CreateValueOptions < ActiveRecord::Migration
  def change
    create_table :value_options do |t|
      t.integer :value_id
      t.string :color
      t.string :name
      t.integer :field_option_id

      t.timestamps
    end
  end
end
