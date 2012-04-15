class CreateFileProperties < ActiveRecord::Migration
  def change
    create_table :file_properties do |t|
      t.string :name
      t.string :title
      t.string :type
      t.string :join_main
      t.string :join_secondary
      t.integer :user_options_id

      t.timestamps
    end
  end
end
