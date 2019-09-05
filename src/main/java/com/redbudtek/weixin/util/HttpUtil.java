package com.redbudtek.weixin.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.URL;

import org.apache.log4j.Logger;

/**
 * http连接的相关工具方法，使用的是cloud-web-new后台的HttpTool，稍作修改
 * @author jinxin.zhou
 */
public class HttpUtil {
	
	private static Logger logger = Logger.getLogger(HttpUtil.class);
	
	public static String post(String urlStr,String messageOut) {
        HttpURLConnection httpConn = null;
        URL url = null;
        String messageIn="";
        try {
            url = new URL(urlStr);
            httpConn = (HttpURLConnection) url.openConnection();
            httpConn.setRequestMethod("POST");
            httpConn.setDoInput(true);
            httpConn.setDoOutput(true);
            httpConn.setRequestProperty("Accept-Charset", "UTF-8");
            httpConn.setRequestProperty("Content-Type", "application/json");
            PrintWriter out = new PrintWriter(new OutputStreamWriter(httpConn.getOutputStream(),"UTF-8"));
            out.println(messageOut);
            out.flush();
            BufferedReader bin = new BufferedReader(new InputStreamReader(
                    httpConn.getInputStream(),"utf-8"));
            StringBuffer buff = new StringBuffer();
            String line;
            while ((line = bin.readLine()) != null) {
                buff.append(line);
            }
            messageIn = buff.toString();
            out.close();
            bin.close();
            httpConn.disconnect();
        } catch (ConnectException ce) {
        	logger.error(ce.getMessage());
        } catch (IOException ie) {
            logger.error(ie.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return messageIn;
    }

    public static String put(String urlStr,String messageOut) {
        HttpURLConnection httpConn = null;
        URL url = null;
        String messageIn="";
        try {
            url = new URL(urlStr);
            httpConn = (HttpURLConnection) url.openConnection();
            httpConn.setRequestMethod("PUT");
            httpConn.setDoInput(true);
            httpConn.setDoOutput(true);
            httpConn.setRequestProperty("Accept-Charset", "UTF-8");
            httpConn.setRequestProperty("Content-Type", "application/json");
            PrintWriter out = new PrintWriter(new OutputStreamWriter(httpConn.getOutputStream(),"UTF-8"));
            out.println(messageOut);
            out.flush();
            BufferedReader bin = new BufferedReader(new InputStreamReader(
                    httpConn.getInputStream(),"utf-8"));
            StringBuffer buff = new StringBuffer();
            String line;
            while ((line = bin.readLine()) != null) {
                buff.append(line);
            }
            messageIn = buff.toString();
            out.close();
            bin.close();
            httpConn.disconnect();
        } catch (ConnectException ce) {
        	logger.error(ce.getMessage());
        } catch (IOException ie) {
            logger.error(ie.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return messageIn;
    }

    public static String put2(String urlStr) {
        HttpURLConnection httpConn = null;
        URL url = null;
        String messageIn="";
        try {
            url = new URL(urlStr);
            httpConn = (HttpURLConnection) url.openConnection();
            httpConn.setRequestMethod("PUT");
            httpConn.setDoInput(true);
            httpConn.setDoOutput(true);
            httpConn.setRequestProperty("Accept-Charset", "UTF-8");
            httpConn.setRequestProperty("Content-Type", "application/json");
            PrintWriter out = new PrintWriter(new OutputStreamWriter(httpConn.getOutputStream(),"UTF-8"));
            out.flush();
            BufferedReader bin = new BufferedReader(new InputStreamReader(
                    httpConn.getInputStream(),"utf-8"));
            StringBuffer buff = new StringBuffer();
            String line;
            while ((line = bin.readLine()) != null) {
                buff.append(line);
            }
            messageIn = buff.toString();
            out.close();
            bin.close();
            httpConn.disconnect();
        } catch (ConnectException ce) {
            logger.error(ce.getMessage());
        } catch (IOException ie) {
            logger.error(ie.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return messageIn;
    }

    public static String delete(String urlStr) {
        HttpURLConnection httpConn = null;
        URL url = null;
        String messageIn="";
        try {
            url = new URL(urlStr);
            httpConn = (HttpURLConnection) url.openConnection();
            httpConn.setRequestMethod("DELETE");
            httpConn.setDoInput(true);
            httpConn.setDoOutput(true);
            httpConn.setRequestProperty("Accept-Charset", "UTF-8");
            httpConn.setRequestProperty("Content-Type", "application/json");
            BufferedReader bin = new BufferedReader(new InputStreamReader(
                    httpConn.getInputStream(),"utf-8"));
            StringBuffer buff = new StringBuffer();
            String line;
            while ((line = bin.readLine()) != null) {
                buff.append(line);
            }
            messageIn = buff.toString();

            bin.close();
            httpConn.disconnect();
        } catch (ConnectException ce) {
        	logger.error(ce.getMessage());
        } catch (IOException ie) {
            logger.error(ie.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return messageIn;
    }

    public static String get(String urlStr) {
        HttpURLConnection httpConn = null;
        URL url = null;
        String messageIn="";
        try {
            url = new URL(urlStr);
            httpConn = (HttpURLConnection) url.openConnection();
            httpConn.setRequestMethod("GET");
            httpConn.setRequestProperty("Accept-Charset", "utf-8");
            httpConn.setRequestProperty("Content-Type", "application/json");
            BufferedReader bin = new BufferedReader(new InputStreamReader(
                    httpConn.getInputStream(),"utf-8"));
            StringBuffer buff = new StringBuffer();
            String line;
            while ((line = bin.readLine()) != null) {
                buff.append(line);
            }
            messageIn = buff.toString();
            bin.close();
            httpConn.disconnect();
        } catch (ConnectException ce) {
        	logger.error(ce.getMessage());
        } catch (IOException ie) {
            logger.error(ie.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return messageIn;
    }
}
