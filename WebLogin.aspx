<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebLogin.aspx.cs" Inherits="OLMap.WebLogin" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>OLMap Demo登入</title>
    <link rel="stylesheet" href="css/login.css">
</head>
<body class="login-page">
    <form id="form1" runat="server" defaultbutton="LoginBtn">
        <div class="center">
            <div class="title">
                OLMap Demo
            </div>
            <div class="line"></div>
            <div id="inputs">
                <table id="otherLogin">
                    <tr>
                        <td colspan="2" class="login-hint">請輸入帳號密碼</td>
                    </tr>
                    <tr>
                        <td>帳號</td>
                        <td>
                            <asp:TextBox ID="txt_user" placeholder="請輸入帳號" runat="server"></asp:TextBox>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" align="right">
                            <asp:RequiredFieldValidator ID="UserNameRequired" runat="server" ControlToValidate="txt_user"
                                ErrorMessage="*帳號必填" ToolTip="必須提供使用者名稱。" ValidationGroup="Login2" CssClass="warning-text">
                            </asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td>密碼</td>
                        <td>
                            <asp:TextBox ID="txt_pass" placeholder="請輸入密碼" runat="server" TextMode="Password">
                            </asp:TextBox>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" align="right">
                            <asp:RequiredFieldValidator ID="PasswordRequired" runat="server" ControlToValidate="txt_pass"
                                ErrorMessage="*密碼必填" ToolTip="必須提供密碼。" ValidationGroup="Login2" CssClass="warning-text">
                            </asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <asp:Button ID="LoginBtn" Text="登入" CssClass="button-act" runat="server"
                                ValidationGroup="Login2" OnClick="LoginBtn_Click" />
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </form>
</body>
</html>
