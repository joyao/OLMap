using MathNet.Numerics.LinearAlgebra;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;

public class POINT
{
    public double x;
    public double y;
}

public class ConformalOutput
{
    public string equ_X;
    public string equ_Y;
    public double a;
    public double b;
    public double Tx;
    public double Ty;
    public double Sigma0;
    public List<POINT> Converted;
}

public class AffineOutput
{
    public string equ_X;
    public string equ_Y;
    public double a1;
    public double a2;
    public double b1;
    public double b2;
    public double Tx;
    public double Ty;
    public double Sigma0;
    public List<POINT> Converted;
}

/// <summary>
/// TransService 的摘要描述
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允許使用 ASP.NET AJAX 從指令碼呼叫此 Web 服務，請取消註解下列一行。
[System.Web.Script.Services.ScriptService]
public class TransService : System.Web.Services.WebService
{

    [WebMethod(EnableSession = true)]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public string ConformalTrans(string ori_point, string control_point, string unconvert_point)
    {

        List<POINT> OriPointList = JsonConvert.DeserializeObject<List<POINT>>(ori_point);
        List<POINT> ControlPointList = JsonConvert.DeserializeObject<List<POINT>>(control_point);
        List<POINT> UnconvertPointList = JsonConvert.DeserializeObject<List<POINT>>(unconvert_point);
        if(OriPointList.Count != ControlPointList.Count || ControlPointList.Count < 2)
        {
            Context.Response.Status = "500 Invalid point number";
            Context.Response.StatusCode = 500;
            Context.ApplicationInstance.CompleteRequest();
            return null;
        }
        else
        {
            var M = Matrix<double>.Build;
            var A = M.Dense(OriPointList.Count * 2, 4);
            var L = M.Dense(ControlPointList.Count * 2, 1);
            var P = M.DenseDiagonal(OriPointList.Count * 2, OriPointList.Count * 2, 1);
            for (int i = 0; i < OriPointList.Count; i++)
            {
                A[i * 2, 0] = OriPointList[i].x;
                A[i * 2, 1] = OriPointList[i].y;
                A[i * 2, 2] = 1;
                A[i * 2 + 1, 0] = OriPointList[i].y;
                A[i * 2 + 1, 1] = -OriPointList[i].x;
                A[i * 2 + 1, 3] = 1;
                L[i * 2, 0] = ControlPointList[i].x;
                L[i * 2 + 1, 0] = ControlPointList[i].y;
            }
            var dX = (A.Transpose() * P * A).Inverse() * (A.Transpose() * P * L);
            var V = A * dX - L;
            var Sigma0 = Math.Sqrt((V.Transpose() * P * V)[0, 0] / (OriPointList.Count * 2 - 4));
            var output = new ConformalOutput()
            {
                equ_X = "X = a*x + b*y + Tx",
                equ_Y = "Y = -b*x + a*y + Ty",
                a = dX[0, 0],
                b = dX[1, 0],
                Tx = dX[2, 0],
                Ty = dX[3, 0],
                Sigma0 = Sigma0,
                Converted = new List<POINT>()
            };
            if (UnconvertPointList != null)
            {

                List<POINT> arrList = new List<POINT>();
                for (int j = 0; j < UnconvertPointList.Count; j++)
                {
                    arrList.Add(new POINT()
                    {
                        x = output.a * UnconvertPointList[j].x + output.b * UnconvertPointList[j].y + output.Tx,
                        y = output.a * UnconvertPointList[j].y - output.b * UnconvertPointList[j].x + output.Ty
                    });
                }
                output.Converted = arrList;
            }

            return new JavaScriptSerializer().Serialize(output);
        }

    }

    [WebMethod(EnableSession = true)]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public string AffineTrans(string ori_point, string control_point, string unconvert_point)
    {

        List<POINT> OriPointList = JsonConvert.DeserializeObject<List<POINT>>(ori_point);
        List<POINT> ControlPointList = JsonConvert.DeserializeObject<List<POINT>>(control_point);
        List<POINT> UnconvertPointList = JsonConvert.DeserializeObject<List<POINT>>(unconvert_point);
        if (OriPointList.Count != ControlPointList.Count || ControlPointList.Count < 3)
        {
            Context.Response.Status = "500 Invalid point number";
            Context.Response.StatusCode = 500;
            Context.ApplicationInstance.CompleteRequest();
            return null;
        }
        else
        {
            var M = Matrix<double>.Build;
            var A = M.Dense(OriPointList.Count * 2, 6);
            var L = M.Dense(ControlPointList.Count * 2, 1);
            var P = M.DenseDiagonal(OriPointList.Count * 2, OriPointList.Count * 2, 1);
            for (int i = 0; i < OriPointList.Count; i++)
            {
                A[i * 2, 0] = 1;
                A[i * 2, 1] = OriPointList[i].x;
                A[i * 2, 2] = OriPointList[i].y;
                A[i * 2 + 1, 3] = 1;
                A[i * 2 + 1, 4] = OriPointList[i].x;
                A[i * 2 + 1, 5] = OriPointList[i].y;
                L[i * 2, 0] = ControlPointList[i].x;
                L[i * 2 + 1, 0] = ControlPointList[i].y;
            }
            var dX = (A.Transpose() * P * A).Inverse() * (A.Transpose() * P * L);
            var V = A * dX - L;
            var Sigma0 = Math.Sqrt((V.Transpose() * P * V)[0, 0] / (OriPointList.Count * 2 - 6));
            var output = new AffineOutput()
            {
                equ_X = "X = a1*x + a2*y + Tx",
                equ_Y = "Y = b1*x + b2*y + Ty",
                a1 = dX[1, 0],
                a2 = dX[2, 0],
                Tx = dX[0, 0],
                b1 = dX[4, 0],
                b2 = dX[5, 0],
                Ty = dX[3, 0],
                Sigma0 = Sigma0,
                Converted = new List<POINT>()
            };
            if (UnconvertPointList != null)
            {

                List<POINT> arrList = new List<POINT>();
                for (int j = 0; j < UnconvertPointList.Count; j++)
                {
                    arrList.Add(new POINT()
                    {
                        x = output.a1 * UnconvertPointList[j].x + output.a2 * UnconvertPointList[j].y + output.Tx,
                        y = output.b1 * UnconvertPointList[j].x + output.b2 * UnconvertPointList[j].y + output.Ty
                    });
                }
                output.Converted = arrList;
            }

            return new JavaScriptSerializer().Serialize(output);
        }
    }
}
