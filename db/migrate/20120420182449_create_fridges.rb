class CreateFridges < ActiveRecord::Migration
  def self.up
    create_table :fridges do |t|
      t.references :vaccine_file
      t.text :data
    end
  end

  def self.down
    drop_table :fridges
  end
end
