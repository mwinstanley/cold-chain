class CreateFridges < ActiveRecord::Migration
  def self.up
    create_table :fridges do |t|
      t.integer :file_id
    end
  end

  def self.down
    drop_table :fridges
  end
end
