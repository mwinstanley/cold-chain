class CreateFeatures < ActiveRecord::Migration
  def self.up
    create_table :features do |t|
      t.references :field, :value
      t.references :owning_object, :polymorphic => true
    end
  end

  def self.down
    drop_table :features
  end
end
