require 'csv'

class FacilitiesController < ApplicationController
  def show
  end

  def index
    logger.info "Showing facilities data, type = " + params["type"]
    if params["id"].nil?
      render :json => ""
    else
      if params["type"] == "h"
        # TODO: PERSONALIZE BY OPTIONS
        render :json => ActiveSupport::JSON.encode(Facility.get_feature_headers)
      else
        logger.info "Providing facility data"
        opt = UserOptions.find_by_id(params["id"])
        hash = { "options" => opt.as_json,
                 "facilities" => Facility.get_all_facilities(opt) }
        render :json => ActiveSupport::JSON.encode(hash)
      end
    end
  end

  private

  def readFacilities(options)
    types = ["main", "fridge", "schedule"]
    main_name = ""
    for t in types do
      props = (options.find_props_by_name(t))[0]
      if t == "main"
        main_name = props.name
      end
      logger.debug props
      readFile(t, props, options, main_name)
    end
  end

  private
  def readFile(f_type, file_props, options, main_name)
    CSV.foreach(file_props.name, :headers => true) do |line|
      Facility.find_or_create_from_row(main_name, line, file_props.join_main, file_props.join_secondary, f_type)
    end
  end
end
