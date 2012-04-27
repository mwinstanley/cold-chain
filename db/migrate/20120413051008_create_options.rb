class CreateOptions < ActiveRecord::Migration
  def self.up
    create_table :facility_options do |t|
      t.string :file_name
      t.string :main_col
      t.references :user_options
    end

    create_table :fridge_options do |t|
      t.string :file_name
      t.string :main_col
      t.string :join_main
      t.references :user_options
    end

    create_table :schedule_options do |t|
      t.text :file_names
      t.text :file_readable_names
      t.string :main_col
      t.string :join_main
      t.references :user_options
    end
  end

  def self.down
    drop_table :facility_options
    drop_table :fridge_option
    drop_table :schedule_options
  end
end
