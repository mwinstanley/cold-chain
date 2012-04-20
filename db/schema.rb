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

ActiveRecord::Schema.define(:version => 20120416010240) do

  create_table "display_types", :force => true do |t|
    t.string   "str"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "facilities", :force => true do |t|
    t.string   "facility_id"
    t.string   "file_name"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "feature_sets", :force => true do |t|
    t.integer  "facility_id"
    t.string   "name"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "features", :force => true do |t|
    t.string   "field_id"
    t.string   "value_id"
    t.integer  "feature_set_id"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
  end

  create_table "field_options", :force => true do |t|
    t.integer  "field_id"
    t.string   "name"
    t.integer  "field_type_id"
    t.integer  "display_type_id"
    t.boolean  "in_info_box"
    t.integer  "file_property_id"
    t.datetime "created_at",       :null => false
    t.datetime "updated_at",       :null => false
  end

  create_table "field_types", :force => true do |t|
    t.string   "str"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "fields", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "file_properties", :force => true do |t|
    t.string   "name"
    t.string   "title"
    t.string   "p_type"
    t.string   "join_main"
    t.string   "join_secondary"
    t.integer  "user_options_id"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  create_table "user_options", :force => true do |t|
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "value_options", :force => true do |t|
    t.integer  "value_id"
    t.string   "color"
    t.string   "name"
    t.integer  "field_option_id"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  create_table "values", :force => true do |t|
    t.string   "val"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

end
