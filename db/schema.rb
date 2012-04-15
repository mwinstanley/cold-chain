# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120413053001) do

  create_table "facilities", :force => true do |t|
    t.string   "facility_id"
    t.integer  "facility_features"
    t.integer  "fridge_features"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
  end

  create_table "feature_sets", :force => true do |t|
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "features", :force => true do |t|
    t.string   "name"
    t.string   "value"
    t.integer  "feature_set_id"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
  end

  create_table "fields", :force => true do |t|
    t.string   "id_in_file"
    t.string   "name"
    t.string   "field_type"
    t.string   "display_type"
    t.boolean  "in_info_box"
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
  end

  create_table "file_properties", :force => true do |t|
    t.string   "name"
    t.string   "title"
    t.string   "type"
    t.string   "join_main"
    t.string   "join_secondary"
    t.integer  "user_options_id"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  create_table "user_options", :force => true do |t|
    t.integer  "main_properties"
    t.integer  "fridge_properties"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
  end

  create_table "values", :force => true do |t|
    t.string   "id_from_file"
    t.string   "color"
    t.string   "name"
    t.integer  "field_id"
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
  end

end
