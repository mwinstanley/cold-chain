class CreateUserOptions < ActiveRecord::Migration
  def self.up
    create_table :user_options do |t|
      t.string :name
      t.string :lat
      t.string :lon
      t.boolean :is_utm
      t.boolean :south_hemi
      t.integer :zone
      t.float :lat_center
      t.float :lon_center
    end
  end

  def self.down
    drop_table :user_options
  end
end
