using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OLMap
{
    public partial class WebLogin : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            FormsAuthentication.SignOut();
            Session["token"] = Session["username"] = null;
            Session.RemoveAll();
        }

        protected void LoginBtn_Click(object sender, EventArgs e)
        {
                bool isValid = false;
                string userInput = txt_user.Text.TrimEnd();
                string passwordInput = txt_pass.Text.TrimEnd();

                isValid = validatesApiUser(userInput, passwordInput);
                Session["username"] = userInput;

                if (isValid)
                {
                    Response.Redirect("~/map.aspx");
                }
                else
                {
                    Session["username"] = null;
                    this.Page.Controls.Add(new LiteralControl("<script language='javascript'>alert('帳號密碼錯誤');</script>"));
                }
        }

        public static bool validatesApiUser(string userInput, string passwordInput)
        {
            string url = ConfigurationManager.AppSettings["OLMapAPI"] + "/api/Auth/validatesApiUser";

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";
            request.ContentType = "application/json; charset=utf-8";

            using (var streamWriter = new StreamWriter(request.GetRequestStream()))
            {
                string json = "{\"userid\":\"" + userInput + "\",\"password\":\"" + passwordInput + "\"}";

                streamWriter.Write(json);
            }

            //API回傳的字串
            string responseStr = "";
            //發出Request
            HttpWebResponse res;
            try
            {
                res = (HttpWebResponse)request.GetResponse();
            }
            catch (WebException ex)
            {
                res = (HttpWebResponse)ex.Response;
            }
            StreamReader sr = new StreamReader(res.GetResponseStream(), Encoding.UTF8);
            responseStr = sr.ReadToEnd();

            JObject obj = (JObject)JsonConvert.DeserializeObject(responseStr);
            System.Web.HttpContext.Current.Session["token"] = Convert.ToString(obj["token"]);
            if (Convert.ToString(obj["token"]) == "")
            {
                return false;
            }
            else
            {
                return true;
            }

        }

    }
}