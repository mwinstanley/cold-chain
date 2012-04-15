class CreateUserOptions < ActiveRecord::Migration
  def change
    create_table :user_options do |t|
      t.integer :main_properties_id
      t.integer :fridge_properties_id

      t.timestamps
    end
  end
end
