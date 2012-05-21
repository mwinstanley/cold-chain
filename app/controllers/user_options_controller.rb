class UserOptionsController < ApplicationController

  def create
    logger.info "Creating a new user options with params " + params["data"]
    data = ActiveSupport::JSON.decode(params["data"])
    update_type = params["type"]
    opt = UserOptions.new
    if update_type == "files"
      opt.update_files(data["facility"], data["fridge"], data["schedule"])
    end
    opt.save
    redirect_to "/?id=" + opt.id.to_s
  end

  def show
    logger.info "Showing a user options with ID " + params["id"]
    options = UserOptions.find_by_id(params["id"])
    logger.debug  ActiveSupport::JSON.encode(options)
    render :json => ActiveSupport::JSON.encode(options)
  end

  def index
    logger.debug "User options index"
  end

  def update
    logger.info "Updating user options with id " + params["id"]
    data = ActiveSupport::JSON.decode(params["data"])
    update_type = params["type"]
    opt = UserOptions.find_by_id(params["id"])
    if update_type == "files"
      opt.update_files(data["facility"], data["fridge"], data["schedule"])
    elsif update_type == "fields"
      opt.update_fields(data["facility"], data["fridge"], data["schedule"])
    elsif update_type == "values"
      opt.update_values(data["facility"], data["fridge"], data["schedule"])
    elsif update_type == "gps"
      opt.update_attributes(:lat => data["lat"],
                            :lon => data["lon"],
                            :is_utm => data["is_utm"],
                            :south_hemi => data["south_hemi"],
                            :zone => data["zone"],
                            :lat_center => data["lat_center"],
                            :lon_center => data["lon_center"])
    elsif update_type == "info_box"
      opt.update_info_box(data)
    elsif update_type == "map_display"
      opt.update_displays("map", data)
    elsif update_type == "filter_display"
      opt.update_displays("filter", data)
    elsif update_type == "pie_display"
      opt.update_displays("pie", data)
    end
    opt.save
    redirect_to "/?id=" + opt.id.to_s
  end
end
