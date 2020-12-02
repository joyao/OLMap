using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;

public class LayerResourceList
{
    public string ID = "";
    public string GroupID = "";
    public string GroupName = "";
    public string LayerID = "";
    public string LayerOrder = "";
    public string LayerQueryable = "";
    public string LayerTitle = "";
    public string LayerType = "";
    public string DataType = "";
    public string DataURL = "";
    public string LayerVisibleCode = "";
    public string OpenOpacity = "";

    public LayerResourceList(string _ID, string _GroupID, string _GroupName, string _LayerID, string _LayerOrder, string _LayerQueryable, string _LayerTitle, string _LayerType, string _DataType, string _DataURL, string _LayerVisibleCode, string _OpenOpacity)
    {
        ID = _ID;
        GroupID = _GroupID;
        GroupName = _GroupName;
        LayerID = _LayerID;
        LayerOrder = _LayerOrder;
        LayerQueryable = _LayerQueryable;
        LayerTitle = _LayerTitle;
        LayerType = _LayerType;
        DataType = _DataType;
        DataURL = _DataURL;
        LayerVisibleCode = _LayerVisibleCode;
        OpenOpacity = _OpenOpacity;
    }
    public LayerResourceList() { }
}

public class CountyList
{
    public string countycode = "";
    public string countyname = "";
    public string geom = "";

    public CountyList(string _countycode, string _countyname, string _geom)
    {
        countycode = _countycode;
        countyname = _countyname;
        geom = _geom;
    }
    public CountyList() { }
}

/// <summary>
/// LayerService 的摘要描述
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允許使用 ASP.NET AJAX 從指令碼呼叫此 Web 服務，請取消註解下列一行。
[System.Web.Script.Services.ScriptService]
public class LayerService : System.Web.Services.WebService
{

    [WebMethod(EnableSession = true)]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public string getLayerResource()
    {
        SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["OLDemoDB"].ConnectionString);
        SqlCommand cmd = new SqlCommand("SELECT [ID] ,[GroupID] ,[GroupName] ,[LayerID] ,[LayerOrder] ,[LayerQueryable] ,[LayerTitle] ,[LayerType],[DataType] ,[DataURL] ,[LayerVisibleCode] ,[OpenOpacity]  FROM [OLDemo].[dbo].[LayerResource]  order by [GroupID], [LayerOrder], [LayerType]", conn);
        conn.Open();
        List<LayerResourceList> arrList = new List<LayerResourceList>();
        SqlDataReader dr = cmd.ExecuteReader();
        while (dr.Read())
        {
            arrList.Add(new LayerResourceList()
            {
                ID = dr["ID"].ToString(),
                GroupID = dr["GroupID"].ToString(),
                GroupName = dr["GroupName"].ToString(),
                LayerID = dr["LayerID"].ToString(),
                LayerOrder = dr["LayerOrder"].ToString(),
                LayerQueryable = dr["LayerQueryable"].ToString(),
                LayerTitle = dr["LayerTitle"].ToString(),
                LayerType = dr["LayerType"].ToString(),
                DataType = dr["DataType"].ToString(),
                DataURL = dr["DataURL"].ToString(),
                LayerVisibleCode = dr["LayerVisibleCode"].ToString(),
                OpenOpacity = dr["OpenOpacity"].ToString(),
            });
        }
        conn.Close();
        dr.Dispose();
        cmd.Dispose();
        conn.Dispose();
        return new JavaScriptSerializer().Serialize(arrList);
    }

    [WebMethod(EnableSession = true)]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public string getCountyList()
    {
        SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["OLDemoDB"].ConnectionString);
        SqlCommand cmd = new SqlCommand("SELECT distinct [countycode],[countyname] ,[geom].STAsText() as geom  FROM [OLDemo].[dbo].[COUNTY_MOI] order by [countycode] desc", conn);
        conn.Open();
        List<CountyList> arrList = new List<CountyList>();
        SqlDataReader dr = cmd.ExecuteReader();
        while (dr.Read())
        {
            arrList.Add(new CountyList()
            {
                countycode = dr["countycode"].ToString(),
                countyname = dr["countyname"].ToString(),
                geom = dr["geom"].ToString()
            });
        }
        conn.Close();
        dr.Dispose();
        cmd.Dispose();
        conn.Dispose();
        JavaScriptSerializer jss = new JavaScriptSerializer();
        jss.MaxJsonLength = int.MaxValue;
        return jss.Serialize(arrList);
    }

}
