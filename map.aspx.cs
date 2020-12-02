using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OLMap
{
    public partial class map : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                if (string.IsNullOrEmpty(Session["token"]?.ToString()) || string.IsNullOrEmpty(Session["username"]?.ToString()))
                {
                    Page.Response.Redirect("~/WebLogin.aspx");
                }
            }
        }
    }
}