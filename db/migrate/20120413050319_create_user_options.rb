class CreateUserOptions < ActiveRecord::Migration
  def self.up
    create_table :user_options do |t|
      t.string :name
      t.string :lat
      t.string :lon
      t.boolean :is_utm
    end
  end

  def self.down
    drop_table :user_options
  end
end
