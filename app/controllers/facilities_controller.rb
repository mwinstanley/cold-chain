require 'csv'

class FacilitiesController < ApplicationController
  def show
  end


  def index
    logger.info "Showing facilities data, type = " + params["type"]
    if params["id"].nil?
      render :json => ""
    else
      if Facility.all.empty?
        logger.info "Reading facilities from file"
        readFacilities(UserOptions.find_by_id(params["id"]))
      end
      render :json => ActiveSupport::JSON.encode(Facility.get_feature_headers)
    end
  end

  private

  def readFacilities(options)
    types = ["main", "fridge", "schedule"]
    for t in types do
      props = (options.find_props_by_name(t))[0]
      logger.debug props
      readFile(t, props, options)
    end
  end

  private
  def readFile(f_type, file_props, options)
    CSV.foreach(file_props.name, :headers => true) do |line|
      Facility.find_or_create_from_row(line, file_props.join_main, file_props.join_secondary, f_type)
    end
  end
end
