class CreateUserOptions < ActiveRecord::Migration
  def change
    create_table :user_options do |t|

      t.timestamps
    end
  end
end
