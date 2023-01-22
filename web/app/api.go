package app

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gorilla/mux"
	"github.com/Taiki0807/image-selection/web/entity"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)
import "io/ioutil"

type queryFilter struct {
	path  string
	op    string
	value interface{}
}

type queryOrder struct {
	Field string
	Desc  bool
}

type query struct {
	Filter []*queryFilter
	Order  *queryOrder
}
// レスポンスJsonの定義
type SampleResponse struct {
	Status     string `json:"status"`
	Message    string `json:"message"`
	ReturnCode string `json:"returnCode"`
}

const limit = 30

var (
	sizeMap = map[string]string{
		"256":  "Size0256",
		"512":  "Size0512",
		"1024": "Size1024",
	}
	sortMap = map[string]string{
		"id":           "ID",
		"updated_at":   "UpdatedAt",
		"published_at": "PublishedAt",
	}
)

func (app *App) imagesHandler(w http.ResponseWriter, r *http.Request) {
	images, err := app.fetchImages(r)
	if err != nil {
		log.Printf("failed to fetch data: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&images); err != nil {
		log.Printf("failed to encode images: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

func (app *App) updateImageHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var data struct {
		Status entity.Status `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		log.Printf("failed to decode json: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	if err := app.updateImage(r.Context(), vars["id"], data.Status); err != nil {
		log.Printf("failed to update status: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type Data1 struct {
	ID string `json:"id"`
	Title string `json:"title"`
	Message string `json:"message"`
}
func (app *App) likeImageHandler(w http.ResponseWriter, r *http.Request) {
	_,_, err := app.fsClient.Collection("users").Add(r.Context(),map[string]interface{}{
        "first": "Ada",
        "last":  "Lovelace",
        "born":  1815,
    })
	if err != nil {
        log.Fatalf("Failed adding alovelace: %v", err)
    }    
	log.Printf("likeimage")
    // リターンコードの設定
    returnCode := 200

    // httpResponseの内容を設定
    res := &SampleResponse{
        Status:     "OK",
        Message:    "ook",
        ReturnCode: strconv.Itoa(returnCode),
    }
    // レスポンスヘッダーの設定
    w.Header().Set("Content-Type", "application/json; charset=UTF-8")

    // ステータスコードを設定
    w.WriteHeader(returnCode)

    // httpResponseの内容を書き込む
    buf, _ := json.MarshalIndent(res, "", "    ")
    _, _ = w.Write(buf)
}
// 構造を宣言
type User struct {
    Uid string `json:"uid"`
    Image_url  string    `json:"image_url"`
	Status  int    `json:"status"`
}
var Good []string
var Bad []string
func (app *App) userImageHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("userimage")
	var user User
    json.NewDecoder(r.Body).Decode(&user)
	if(user.Status == 3){
		newslice := append(Good,user.Image_url)
		Good = newslice
	}else if(user.Status == 1){
		newslice := append(Bad,user.Image_url)
		Bad = newslice
	}
	log.Printf("url:"+user.Image_url)
	_, err := app.fsClient.Collection("users").Doc(user.Uid).Set(r.Context(),map[string]interface{}{
        "goodimage_url": Good,
		"badimage_url": Bad,
		"updatedAt": time.Now(),
    },firestore.MergeAll)
	if err != nil {
        log.Fatalf("Failed adding data userImage: %v", err)
    }

}
// 構造を宣言
type User_matching struct {
    Uid string `json:"uid"`
}
// レスポンスJsonの定義
type MatchingResponse struct {
	Status     string `json:"status"`
	Message    []string `json:"message"`
	ReturnCode string `json:"returnCode"`
}

func (app *App) matchingHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("matching")
	var user User_matching
    json.NewDecoder(r.Body).Decode(&user)
	doc, err := app.fsClient.Collection("matching").Doc(user.Uid).Get(r.Context())
	if err != nil {
		fmt.Printf("Failed to get doc matching: %v", err)
		return
	}
	likeUsers := doc.Data()["matched"]
	matching := []string{}
	for _, likeUser := range likeUsers.([]interface{}) {
		matching = append(matching, likeUser.(string))
	}

    // リターンコードの設定
    returnCode := 200

    // httpResponseの内容を設定
    res := &MatchingResponse{
        Status:     "OK",
        Message:    matching,
        ReturnCode: strconv.Itoa(returnCode),
    }
    // レスポンスヘッダーの設定
    w.Header().Set("Content-Type", "application/json; charset=UTF-8")

    // ステータスコードを設定
    w.WriteHeader(returnCode)

    // httpResponseの内容を書き込む
    buf, _ := json.MarshalIndent(res, "", "    ")
    _, _ = w.Write(buf)
}
// 構造を宣言
type LikeStatus struct {
    Uid string `json:"uid"`
    Like  string    `json:"like"`
	Vector  []float64    `json:"vector"`
}
func (app *App) userLikeHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("failed to read request body: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	fmt.Println(string(body))
	fmt.Println("userimage ok")
	var likestatus LikeStatus
    json.NewDecoder(r.Body).Decode(&likestatus)
	_,_, err = app.fsClient.Collection("users").Add(r.Context(),map[string]interface{}{
        "Like": likestatus.Like,
        "last":  "Lovelace",
        "UpdatedAt":  time.Now(),
    })
	if err != nil {
        log.Fatalf("Failed adding alovelace: %v", err)
    }    
	// リターンコードの設定
    returnCode := 200

    // httpResponseの内容を設定
    res := &SampleResponse{
        Status:     "OK",
        Message:    "ook",
        ReturnCode: strconv.Itoa(returnCode),
    }
    // レスポンスヘッダーの設定
    w.Header().Set("Content-Type", "application/json; charset=UTF-8")

    // ステータスコードを設定
    w.WriteHeader(returnCode)

    // httpResponseの内容を書き込む
    buf, _ := json.MarshalIndent(res, "", "    ")
    _, _ = w.Write(buf)
}

type Data_image struct {
	Likeimageurl string `json:"url"`
}

func (app *App) getlikeimageHandler(w http.ResponseWriter, r *http.Request) {
    r.ParseForm()
	Uid := r.Form.Get("uid")
	 // データ読み取り
	ref, err := app.fsClient.Collection("users").Doc(Uid).Get(r.Context())
	if err != nil {
		log.Printf("Failed adding data getlikeimage: %v", err)
	} else {
		 // データが存在する場合の処理
		url, err := ref.DataAt("likeface_url")
		if err != nil {
			log.Printf("Failed adding data getlikeimage: %v", err)
		} else {
			var data1 = Data_image {
				Likeimageurl:url.(string),
			}
			 // レスポンスヘッダーの設定
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			 // ステータスコードを設定
			w.WriteHeader(200)
			 // httpResponseの内容を書き込む
			buf, _ := json.Marshal(data1)
			_, _ = w.Write(buf)
		}
	}
	 // データが存在しない場合の処理
}


func (app *App) usersimageHandler(w http.ResponseWriter, r *http.Request) {
	images, err := app.fetchusersImages(r)
	if err != nil {
		log.Printf("failed to fetch data usersimageHandler: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&images); err != nil {
		log.Printf("failed to encode images: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}
func (app *App) selectimageHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("userimage ok")
	images, err := app.fetchusersImages_stylegan2(r)
	if err != nil {
		log.Printf("failed to fetch data: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&images); err != nil {
		log.Printf("failed to encode images: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

// 構造を宣言
type matching struct {
    Uid string `json:"uid"`
    Touid  string    `json:"touid"`
	Status int `json:status`
}
var matchinguid []string
var likeuser []string

func (app *App) updatematching(w http.ResponseWriter, r *http.Request) {
	var data matching
    json.NewDecoder(r.Body).Decode(&data)
	if(data.Status == 3){
		newslice := append(likeuser,data.Touid)
		likeuser = newslice
	
		doc, err := app.fsClient.Collection("matching").Doc(data.Touid).Get(r.Context())
		if err != nil {
			fmt.Printf("Failed to get doc: %v", err)
			return
		}
	
		likeUsers := doc.Data()["likeuser"]
		for i, v := range likeUsers.([]interface{}) {
			fmt.Println(i, v.(string))
		}
		if likeUsers == nil {
			fmt.Println("Document does not contain 'likeuser' field.")
			return
		}
	
		matching := []string{}
		for _, likeUser := range likeUsers.([]interface{}) {
			if likeUser == data.Touid {
				matching = append(matching, likeUser.(string))
			}
		}
		matchinguid = matching
		fmt.Println(matchinguid)
		_, err = app.fsClient.Collection("matching").Doc(data.Uid).Set(r.Context(),map[string]interface{}{
			"likeuser":likeuser,
			"matched":matchinguid,
			"updatedAt": time.Now(),
		})
		if err != nil {
			fmt.Printf("Failed to update: %v", err)
			return
		}
		_, err = app.fsClient.Collection("matching").Doc(data.Touid).Update(r.Context(), []firestore.Update{{Path: "matched", Value: matchinguid}, {Path: "updatedAt", Value: time.Now()}})
		if err != nil {
			fmt.Printf("Failed to update: %v", err)
			return
		}

	}else if(data.Status == 1){
		return
	}
}


func (app *App) statsHandler(w http.ResponseWriter, r *http.Request) {
	results := []*countResponse{}
	collection := app.fsClient.Collection(entity.KindNameCount)
	if err := func() error {
		docIDs := []string{"0256", "0512", "1024"}
		for _, docID := range docIDs {
			docRef := collection.Doc(docID)
			doc, err := docRef.Get(r.Context())
			var count entity.Count
			if err != nil {
				if status.Code(err) == codes.NotFound {
					docRef.Set(r.Context(), &count)
				} else {
					return err
				}
			} else {
				if err := doc.DataTo(&count); err != nil {
					return err
				}
			}
			results = append(results, &countResponse{
				Size:      docID,
				Ready:     count.Ready,
				NG:        count.NG,
				Pending:   count.Pending,
				OK:        count.OK,
				Predicted: count.Predicted,
			})
		}
		return nil
	}(); err != nil {
		log.Printf("failed to load stats: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&results); err != nil {
		log.Printf("failed to encode stats: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

func (app *App) fetchImages(r *http.Request) ([]*imageResponse, error) {
	query, err := app.makeQuery(r)
	if err != nil {
		return nil, err
	}
	images := []*imageResponse{}
	iter := query.Documents(r.Context())
	for {
		document, err := iter.Next()
		if err != nil {
			if errors.Is(err, iterator.Done) {
				break
			} else {
				return nil, err
			}
		}
		var image entity.Image
		if err := document.DataTo(&image); err != nil {
			return nil, err
		}
		images = append(images, &imageResponse{
			ID:          image.ID,
			ImageURL:    image.ImageURL,
			Size:        image.Size,
			Status:      int(image.Status),
			Parts:       image.Parts,
			LabelName:   image.LabelName,
			SourceURL:   image.SourceURL,
			PhotoURL:    image.PhotoURL,
			PublishedAt: image.PublishedAt.Unix(),
			UpdatedAt:   image.UpdatedAt.Unix(),
			Meta:        string(image.Meta),
		})
	}
	return images, nil
}


func (app *App) fetchusersImages(r *http.Request) ([]*usersimageResponse, error) {
	query, err := app.makeQuery_user(r)
	if err != nil {
		return nil, err
	}
	images := []*usersimageResponse{}
	iter := query.Documents(r.Context())
	for {
		document, err := iter.Next()
		if err != nil {
			if errors.Is(err, iterator.Done) {
				break
			} else {
				return nil, err
			}
		}
		var image entity.UserImage
		if err := document.DataTo(&image); err != nil {
			return nil, err
		}
		images = append(images, &usersimageResponse{
			ID:          image.ID,
			ImageURL:    image.ImageURL,
			UID:         image.UID,
			UpdatedAt:   image.UpdatedAt.Unix(),
		})
	}
	return images, nil
}

func (app *App) fetchusersImages_stylegan2(r *http.Request) ([]*usersimageResponse2, error) {
	query, err := app.makeQuery_stylegan2(r)
	if err != nil {
		return nil, err
	}
	images := []*usersimageResponse2{}
	iter := query.Documents(r.Context())
	for {
		document, err := iter.Next()
		if err != nil {
			if errors.Is(err, iterator.Done) {
				break
			} else {
				return nil, err
			}
		}
		var image entity.UserImage2 
		if err := document.DataTo(&image); err != nil {
			return nil, err
		}
		images = append(images, &usersimageResponse2{
			ID:          image.ID,
			ImageURL:    image.ImageURL,
			Vector:		 image.Vector,
			UpdatedAt:   image.UpdatedAt.Unix(),
		})
	}
	return images, nil
}

func (app *App) makeQuery(r *http.Request) (*firestore.Query, error) {
	values := r.URL.Query()
	collection := app.fsClient.Collection(entity.KindNameImage)
	query := collection.Query
	if values.Get("count") != "" {
		count, err := strconv.Atoi(values.Get("count"))
		if err != nil {
			return nil, err
		}
		query = query.Limit(count)
	} else {
		query = query.Limit(limit)
	}
	// `Where`
	{
		filters := []*queryFilter{}
		if values.Get("name") != "" {
			filters = append(filters, &queryFilter{
				path:  "LabelName",
				op:    "==",
				value: values.Get("name"),
			})
		}
		if values.Get("status") != "" && values.Get("status") != "all" {
			status, err := strconv.Atoi(values.Get("status"))
			if err != nil {
				return nil, err
			}
			filters = append(filters, &queryFilter{
				path:  "Status",
				op:    "==",
				value: status,
			})
		}
		if values.Get("size") != "" && values.Get("size") != "all" {
			if key, ok := sizeMap[values.Get("size")]; ok {
				filters = append(filters, &queryFilter{
					path:  key,
					op:    "==",
					value: true,
				})
			} else {
				return nil, fmt.Errorf("invalid size query: %v", values.Get("size"))
			}
		}
		for _, filter := range filters {
			query = query.Where(filter.path, filter.op, filter.value)
		}
	}
	// `Order`
	{
		if values.Get("sort") != "" {
			if path, ok := sortMap[values.Get("sort")]; ok {
				reverse := values.Get("reverse") == "true"
				if values.Get("order") == "desc" {
					reverse = !reverse
				}
				if values.Get("id") != "" {
					var op string
					if reverse {
						op = "<="
					} else {
						op = ">="
					}

					var image entity.Image
					document, err := collection.Doc(values.Get("id")).Get(context.Background())
					if err != nil {
						return nil, err
					}
					if err := document.DataTo(&image); err != nil {
						return nil, err
					}
					switch path {
					case "ID":
						query = query.Where(path, op, image.ID)
					case "PublishedAt":
						query = query.Where(path, op, image.PublishedAt)
					case "UpdatedAt":
						query = query.Where(path, op, image.UpdatedAt)
					}
				}
				if reverse {
					query = query.OrderBy(path, firestore.Desc)
				} else {
					query = query.OrderBy(path, firestore.Asc)
				}
			} else {
				return nil, fmt.Errorf("invalid sort query: %v", values.Get("sort"))
			}
		}
	}
	return &query, nil
}

func (app *App) makeQuery_user(r *http.Request) (*firestore.Query, error) {
	values := r.URL.Query()
	collection := app.fsClient.Collection(entity.KindNameUserImage)
	query := collection.Query
	if values.Get("count") != "" {
		count, err := strconv.Atoi(values.Get("count"))
		if err != nil {
			return nil, err
		}
		query = query.Limit(count)
	} else {
		query = query.Limit(limit)
	}
	// `Order`
	{
		if values.Get("sort") != "" {
			if path, ok := sortMap[values.Get("sort")]; ok {
				reverse := values.Get("reverse") == "true"
				if values.Get("order") == "desc" {
					reverse = !reverse
				}
				if values.Get("id") != "" {
					var op string
					if reverse {
						op = "<="
					} else {
						op = ">="
					}
					var image entity.Image
					document, err := collection.Doc(values.Get("id")).Get(context.Background())
					if err != nil {
						return nil, err
					}
					if err := document.DataTo(&image); err != nil {
						return nil, err
					}
					switch path {
					case "ID":
						query = query.Where(path, op, image.ID)
					case "PublishedAt":
						query = query.Where(path, op, image.PublishedAt)
					case "UpdatedAt":
						query = query.Where(path, op, image.UpdatedAt)
					}
				}
				if reverse {
					query = query.OrderBy(path, firestore.Desc)
				} else {
					query = query.OrderBy(path, firestore.Asc)
				}
			} else {
				return nil, fmt.Errorf("invalid sort query: %v", values.Get("sort"))
			}
		}
	}
	return &query, nil
}

func (app *App) makeQuery_stylegan2(r *http.Request) (*firestore.Query, error) {
	values := r.URL.Query()
	collection := app.fsClient.Collection(entity.KindNameSelectImage)
	query := collection.Query
	if values.Get("count") != "" {
		count, err := strconv.Atoi(values.Get("count"))
		if err != nil {
			return nil, err
		}
		query = query.Limit(count)
	} else {
		query = query.Limit(limit)
	}
	// `Order`
	{
		if values.Get("sort") != "" {
			if path, ok := sortMap[values.Get("sort")]; ok {
				reverse := values.Get("reverse") == "true"
				if values.Get("order") == "desc" {
					reverse = !reverse
				}
				if values.Get("id") != "" {
					var op string
					if reverse {
						op = "<="
					} else {
						op = ">="
					}
					var image entity.Image
					document, err := collection.Doc(values.Get("id")).Get(context.Background())
					if err != nil {
						return nil, err
					}
					if err := document.DataTo(&image); err != nil {
						return nil, err
					}
					switch path {
					case "ID":
						query = query.Where(path, op, image.ID)
					case "PublishedAt":
						query = query.Where(path, op, image.PublishedAt)
					case "UpdatedAt":
						query = query.Where(path, op, image.UpdatedAt)
					}
				}
				if reverse {
					query = query.OrderBy(path, firestore.Desc)
				} else {
					query = query.OrderBy(path, firestore.Asc)
				}
			} else {
				return nil, fmt.Errorf("invalid sort query: %v", values.Get("sort"))
			}
		}
	}
	return &query, nil
}
func (app *App) updateImage(ctx context.Context, id string, status entity.Status) error {
	return app.fsClient.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		docRef := app.fsClient.Collection(entity.KindNameImage).Doc(id)
		doc, err := tx.Get(docRef)
		if err != nil {
			log.Printf("failed to get document: %s", err.Error())
			return err
		}
		var image entity.Image
		if err := doc.DataTo(&image); err != nil {
			log.Printf("failed to retrieve image from document: %s", err.Error())
			return err
		}
		if image.Status != status {
			// Update counts
			for i, b := range []bool{image.Size0256, image.Size0512, image.Size1024} {
				if b {
					docID := []string{"0256", "0512", "1024"}[i]
					ref := app.fsClient.Collection(entity.KindNameCount).Doc(docID)
					if err := tx.Update(ref, []firestore.Update{
						{Path: image.Status.Path(), Value: firestore.Increment(-1)},
						{Path: status.Path(), Value: firestore.Increment(1)},
					}); err != nil {
						return err
					}
				}
			}
			// Update status
			image.Status = entity.Status(status)
			image.UpdatedAt = time.Now()
			if err := tx.Set(docRef, &image); err != nil {
				log.Printf("failed to set document: %s", err.Error())
				return err
			}

		}
		return nil
	})
}